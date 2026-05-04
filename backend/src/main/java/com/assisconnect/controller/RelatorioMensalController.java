package com.assisconnect.controller;

import com.assisconnect.dto.RelatorioEstatisticoDTO;
import com.assisconnect.entity.RelatorioMensal;
import com.assisconnect.service.RelatorioMensalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/relatorios")
@CrossOrigin(origins = "*")
public class RelatorioMensalController {

    private final RelatorioMensalService service;

    public RelatorioMensalController(RelatorioMensalService service) {
        this.service = service;
    }

    @GetMapping
    public List<RelatorioMensal> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/ano/{ano}")
    public List<RelatorioMensal> listarPorAno(@PathVariable int ano) {
        return service.listarPorAno(ano);
    }

    @GetMapping("/{mes}/{ano}")
    public RelatorioMensal buscarPorMesEAno(@PathVariable int mes, @PathVariable int ano) {
        return service.buscarPorMesEAno(mes, ano).orElse(null);
    }

    @DeleteMapping("/ano/{ano}")
    public void deletarPorAno(@PathVariable int ano) {
        service.deletarPorAno(ano);
    }

    @PostMapping
    public RelatorioMensal salvarOuAtualizar(@RequestBody RelatorioMensal relatorio) {
        return service.salvarOuAtualizar(relatorio);
    }

    @PostMapping("/gerar-pendentes/{mesAtual}/{anoAtual}")
    public List<RelatorioMensal> gerarPendentes(@PathVariable int mesAtual, @PathVariable int anoAtual) {
        return service.gerarPendentes(mesAtual, anoAtual);
    }

    @GetMapping("/estatisticas/{mes}/{ano}")
    public RelatorioEstatisticoDTO estatisticasDoMes(@PathVariable int mes, @PathVariable int ano) {
        return service.calcularEstatisticas(mes, ano);
    }

    @GetMapping("/{mes}/{ano}/dados-completos")
    public Map<String, Object> dadosCompletos(@PathVariable int mes, @PathVariable int ano) {
        return service.dadosCompletos(mes, ano);
    }
}
