package com.assisconnect.controller;

import com.assisconnect.entity.RegistroSaude;
import com.assisconnect.service.RegistroSaudeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/saude")
@CrossOrigin(origins = "*")
public class RegistroSaudeController {

    private final RegistroSaudeService service;

    public RegistroSaudeController(RegistroSaudeService service) {
        this.service = service;
    }

    @PostMapping
    public RegistroSaude cadastrar(@RequestBody RegistroSaude registro) {
        return service.cadastrar(registro);
    }

    @GetMapping("/idoso/{idosoId}")
    public List<RegistroSaude> listarPorIdoso(@PathVariable Long idosoId) {
        return service.listarPorIdoso(idosoId);
    }

    @GetMapping("/idoso/{idosoId}/ultimo")
    public ResponseEntity<RegistroSaude> ultimoRegistro(@PathVariable Long idosoId) {
        return service.ultimoRegistro(idosoId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroSaude> atualizar(@PathVariable Long id, @RequestBody RegistroSaude dados) {
        return service.atualizar(id, dados)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!service.excluir(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}
