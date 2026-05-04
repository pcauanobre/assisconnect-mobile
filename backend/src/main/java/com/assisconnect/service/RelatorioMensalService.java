package com.assisconnect.service;

import com.assisconnect.dto.RelatorioEstatisticoDTO;
import com.assisconnect.entity.Idoso;
import com.assisconnect.entity.RelatorioMensal;
import com.assisconnect.repository.IdosoRepository;
import com.assisconnect.repository.RelatorioMensalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@SuppressWarnings("null")
public class RelatorioMensalService {

    private final RelatorioMensalRepository relatorioRepository;
    private final IdosoRepository idosoRepository;

    public RelatorioMensalService(RelatorioMensalRepository relatorioRepository,
                                   IdosoRepository idosoRepository) {
        this.relatorioRepository = relatorioRepository;
        this.idosoRepository = idosoRepository;
    }

    public List<RelatorioMensal> listarTodos() {
        return relatorioRepository.findAll();
    }

    public List<RelatorioMensal> listarPorAno(int ano) {
        return relatorioRepository.findByAnoOrderByMesAsc(ano);
    }

    public Optional<RelatorioMensal> buscarPorMesEAno(int mes, int ano) {
        return relatorioRepository.findByMesAndAno(mes, ano);
    }

    public void deletarPorAno(int ano) {
        List<RelatorioMensal> relatorios = relatorioRepository.findByAnoOrderByMesAsc(ano);
        relatorioRepository.deleteAll(relatorios);
    }

    public RelatorioMensal salvarOuAtualizar(RelatorioMensal relatorio) {
        Optional<RelatorioMensal> existenteOpt = relatorioRepository.findByMesAndAno(
                relatorio.getMes(), relatorio.getAno());

        if (existenteOpt.isPresent()) {
            RelatorioMensal existente = existenteOpt.get();
            existente.setObservacoes(relatorio.getObservacoes());
            existente.setChecklist(relatorio.getChecklist());
            preencherEstatisticas(existente, relatorio.getMes(), relatorio.getAno());
            return relatorioRepository.save(existente);
        }

        preencherEstatisticas(relatorio, relatorio.getMes(), relatorio.getAno());
        return relatorioRepository.save(relatorio);
    }

    public List<RelatorioMensal> gerarPendentes(int mesAtual, int anoAtual) {
        List<RelatorioMensal> gerados = new ArrayList<>();
        for (int m = 1; m < mesAtual; m++) {
            Optional<RelatorioMensal> existente = relatorioRepository.findByMesAndAno(m, anoAtual);
            if (existente.isEmpty()) {
                RelatorioMensal novo = new RelatorioMensal();
                novo.setMes(m);
                novo.setAno(anoAtual);
                novo.setFechado(true);
                novo.setDataCriacao(YearMonth.of(anoAtual, m).atEndOfMonth());
                preencherEstatisticas(novo, m, anoAtual);
                gerados.add(relatorioRepository.save(novo));
            } else {
                RelatorioMensal rel = existente.get();
                rel.setFechado(true);
                preencherEstatisticas(rel, m, anoAtual);
                gerados.add(relatorioRepository.save(rel));
            }
        }
        return gerados;
    }

    public RelatorioEstatisticoDTO calcularEstatisticas(int mes, int ano) {
        LocalDate fimDoMes = YearMonth.of(ano, mes).atEndOfMonth();
        List<Idoso> todosAteOMes = idosoRepository.findAllCriadosAte(fimDoMes);
        List<Idoso> novosMes = idosoRepository.findByMesEAnoCriacao(mes, ano);

        int total = todosAteOMes.size();
        int ativos = 0, inativos = 0, falecidos = 0;
        double somaIdades = 0;
        int countIdades = 0, maiorIdade = 0, menorIdade = Integer.MAX_VALUE;
        int countFeminino = 0, countMasculino = 0, countOutro = 0;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Idoso i : todosAteOMes) {
            if (i.isFalecido()) falecidos++;
            else if (i.isInativo()) inativos++;
            else ativos++;

            try {
                if (i.getDataNascimento() != null && !i.getDataNascimento().isEmpty()) {
                    LocalDate nascimento = LocalDate.parse(i.getDataNascimento(), formatter);
                    int idade = Period.between(nascimento, LocalDate.now()).getYears();
                    somaIdades += idade;
                    countIdades++;
                    if (idade > maiorIdade) maiorIdade = idade;
                    if (idade < menorIdade) menorIdade = idade;
                }
            } catch (Exception e) { /* data inválida */ }

            if (i.getSexo() != null) {
                String sexo = i.getSexo().toLowerCase();
                if (sexo.equals("feminino")) countFeminino++;
                else if (sexo.equals("masculino")) countMasculino++;
                else countOutro++;
            }
        }

        double mediaIdade = countIdades > 0 ? somaIdades / countIdades : 0;
        double pctFem = total > 0 ? (countFeminino * 100.0) / total : 0;
        double pctMasc = total > 0 ? (countMasculino * 100.0) / total : 0;
        double pctOutro = total > 0 ? (countOutro * 100.0) / total : 0;
        if (menorIdade == Integer.MAX_VALUE) menorIdade = 0;

        return new RelatorioEstatisticoDTO(
                total, ativos, inativos, falecidos,
                novosMes.size(), mediaIdade,
                maiorIdade, menorIdade,
                pctFem, pctMasc, pctOutro
        );
    }

    public Map<String, Object> dadosCompletos(int mes, int ano) {
        Map<String, Object> resultado = new HashMap<>();
        RelatorioEstatisticoDTO stats = calcularEstatisticas(mes, ano);
        LocalDate fimDoMes = YearMonth.of(ano, mes).atEndOfMonth();
        List<Idoso> todos = idosoRepository.findAllCriadosAte(fimDoMes);
        Optional<RelatorioMensal> rel = relatorioRepository.findByMesAndAno(mes, ano);

        resultado.put("mes", mes);
        resultado.put("ano", ano);
        resultado.put("estatisticas", stats);
        resultado.put("idosos", todos);
        resultado.put("observacoes", rel.map(RelatorioMensal::getObservacoes).orElse(""));
        resultado.put("fechado", rel.map(RelatorioMensal::isFechado).orElse(false));
        return resultado;
    }

    private void preencherEstatisticas(RelatorioMensal rel, int mes, int ano) {
        RelatorioEstatisticoDTO stats = calcularEstatisticas(mes, ano);
        rel.setQuantidadeIdosos(stats.getQuantidadeIdosos());
        rel.setIdososAtivos(stats.getIdososAtivos());
        rel.setIdososInativos(stats.getIdososInativos());
        rel.setIdososFalecidos(stats.getIdososFalecidos());
        rel.setNovosCadastros(stats.getNovosCadastros());
        rel.setMediaIdade(stats.getMediaIdade());
        rel.setIdosoMaisVelho(stats.getIdosoMaisVelho());
        rel.setIdosoMaisNovo(stats.getIdosoMaisNovo());
        rel.setPercentualFeminino(stats.getPercentualFeminino());
        rel.setPercentualMasculino(stats.getPercentualMasculino());
    }
}
