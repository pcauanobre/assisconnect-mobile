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
import java.time.format.DateTimeFormatter;
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

    @GetMapping
    public List<RelatorioMensal> listarTodos() {
        return relatorioRepository.findAll();
    }

    @GetMapping("/{mes}/{ano}")
    public RelatorioMensal buscarPorMesEAno(@PathVariable int mes, @PathVariable int ano) {
        return relatorioRepository.findByMesAndAno(mes, ano).orElse(null);
    }

    @PostMapping
    public RelatorioMensal salvarOuAtualizar(@RequestBody RelatorioMensal relatorio) {
        Optional<RelatorioMensal> existenteOpt = relatorioRepository.findByMesAndAno(relatorio.getMes(), relatorio.getAno());

        if (existenteOpt.isPresent()) {
            RelatorioMensal existente = existenteOpt.get();
            existente.setObservacoes(relatorio.getObservacoes());
            existente.setChecklist(relatorio.getChecklist());
            existente.setQuantidadeIdosos(relatorio.getQuantidadeIdosos());
            return relatorioRepository.save(existente);
        }

        return relatorioRepository.save(relatorio);
    }

    @GetMapping("/estatisticas/{mes}/{ano}")
    public RelatorioEstatisticoDTO estatisticasDoMes(@PathVariable int mes, @PathVariable int ano) {
        List<Idoso> idosos = idosoRepository.findByMesEAnoCriacao(mes, ano);

        int total = idosos.size();
        double mediaIdade = 0;
        int countFeminino = 0;
        int countMasculino = 0;
        int countOutro = 0;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Idoso i : idosos) {
            try {
                if (i.getDataNascimento() != null && !i.getDataNascimento().isEmpty()) {
                    LocalDate nascimento = LocalDate.parse(i.getDataNascimento(), formatter);
                    mediaIdade += Period.between(nascimento, LocalDate.now()).getYears();
                }
            } catch (Exception e) {
                System.out.println("Data de nascimento inválida para o idoso ID=" + i.getId());
            }

            if (i.getSexo() != null) {
                String sexo = i.getSexo().toLowerCase();
                if (sexo.equals("feminino")) {
                    countFeminino++;
                } else if (sexo.equals("masculino")) {
                    countMasculino++;
                } else {
                    countOutro++;
                }
            }
        }

        mediaIdade = total > 0 ? mediaIdade / total : 0;
        double percentualFeminino = total > 0 ? (countFeminino * 100.0) / total : 0;
        double percentualMasculino = total > 0 ? (countMasculino * 100.0) / total : 0;
        double percentualOutro = total > 0 ? (countOutro * 100.0) / total : 0;

        return new RelatorioEstatisticoDTO(total, mediaIdade, percentualFeminino, percentualMasculino, percentualOutro);
    }
}
