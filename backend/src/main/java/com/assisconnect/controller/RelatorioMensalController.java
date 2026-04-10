package com.assisconnect.controller;

import com.assisconnect.dto.RelatorioEstatisticoDTO;
import com.assisconnect.entity.Idoso;
import com.assisconnect.entity.RelatorioMensal;
import com.assisconnect.repository.IdosoRepository;
import com.assisconnect.repository.RelatorioMensalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Period;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/relatorios")
@CrossOrigin(origins = "*")
public class RelatorioMensalController {

    @Autowired
    private RelatorioMensalRepository relatorioRepository;

    @Autowired
    private IdosoRepository idosoRepository;

    // Lista todos os relatorios
    @GetMapping
    public List<RelatorioMensal> listarTodos() {
        return relatorioRepository.findAll();
    }

    // Lista relatorios de um ano especifico
    @GetMapping("/ano/{ano}")
    public List<RelatorioMensal> listarPorAno(@PathVariable int ano) {
        return relatorioRepository.findByAnoOrderByMesAsc(ano);
    }

    // Busca relatorio de um mes/ano
    @GetMapping("/{mes}/{ano}")
    public RelatorioMensal buscarPorMesEAno(@PathVariable int mes, @PathVariable int ano) {
        return relatorioRepository.findByMesAndAno(mes, ano).orElse(null);
    }

    // Limpa todos os relatorios de um ano (pra resetar dados errados)
    @DeleteMapping("/ano/{ano}")
    public void deletarPorAno(@PathVariable int ano) {
        List<RelatorioMensal> relatorios = relatorioRepository.findByAnoOrderByMesAsc(ano);
        relatorioRepository.deleteAll(relatorios);
    }

    // Salva ou atualiza relatorio (mes atual - editavel)
    @PostMapping
    public RelatorioMensal salvarOuAtualizar(@RequestBody RelatorioMensal relatorio) {
        Optional<RelatorioMensal> existenteOpt = relatorioRepository.findByMesAndAno(
                relatorio.getMes(), relatorio.getAno());

        if (existenteOpt.isPresent()) {
            RelatorioMensal existente = existenteOpt.get();
            existente.setObservacoes(relatorio.getObservacoes());
            existente.setChecklist(relatorio.getChecklist());
            // Recalcula estatisticas ao salvar
            preencherEstatisticas(existente, relatorio.getMes(), relatorio.getAno());
            return relatorioRepository.save(existente);
        }

        // Novo relatorio
        preencherEstatisticas(relatorio, relatorio.getMes(), relatorio.getAno());
        return relatorioRepository.save(relatorio);
    }

    // Gera automaticamente todos os relatorios pendentes ate o mes/ano informado
    // Chamado pelo frontend ao abrir a tela de relatorios
    @PostMapping("/gerar-pendentes/{mesAtual}/{anoAtual}")
    public List<RelatorioMensal> gerarPendentes(@PathVariable int mesAtual, @PathVariable int anoAtual) {
        List<RelatorioMensal> gerados = new ArrayList<>();

        // Gera para todos os meses anteriores ao atual que nao tem relatorio
        // Se ja existe, recalcula estatisticas para manter dados atualizados
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
                // Sempre recalcula e fecha
                RelatorioMensal rel = existente.get();
                rel.setFechado(true);
                preencherEstatisticas(rel, m, anoAtual);
                gerados.add(relatorioRepository.save(rel));
            }
        }

        return gerados;
    }

    // Estatisticas em tempo real (para o mes atual, ainda nao fechado)
    @GetMapping("/estatisticas/{mes}/{ano}")
    public RelatorioEstatisticoDTO estatisticasDoMes(@PathVariable int mes, @PathVariable int ano) {
        return calcularEstatisticas(mes, ano);
    }

    // ============================================================
    // Metodos auxiliares
    // ============================================================

    private RelatorioEstatisticoDTO calcularEstatisticas(int mes, int ano) {
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
            } catch (Exception e) { /* data invalida */ }

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
