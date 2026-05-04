package com.assisconnect.controller;

import com.assisconnect.entity.Atividade;
import com.assisconnect.service.AtividadeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/atividades")
@CrossOrigin(origins = "*")
public class AtividadeController {

    private final AtividadeService service;

    public AtividadeController(AtividadeService service) {
        this.service = service;
    }

    @PostMapping
    public Atividade salvar(@RequestBody Atividade novaAtividade) {
        return service.salvarOuAtualizar(novaAtividade);
    }

    @GetMapping
    public List<Atividade> listarPorDataOuTodas(
            @RequestParam(required = false) String data,
            @RequestParam(required = false) String nome) {
        return service.listarPorDataOuTodas(data, nome);
    }

    @GetMapping("/{id}")
    public Atividade buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/hoje")
    public List<Atividade> atividadesDeHoje() {
        return service.buscarAtividadesDeHoje();
    }
}
