package com.assisconnect.controller;

import com.assisconnect.entity.Visita;
import com.assisconnect.service.VisitaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/visitas")
@CrossOrigin(origins = "*")
public class VisitaController {

    private final VisitaService service;

    public VisitaController(VisitaService service) {
        this.service = service;
    }

    @PostMapping
    public Visita cadastrar(@RequestBody Visita visita) {
        return service.cadastrar(visita);
    }

    @GetMapping("/idoso/{idosoId}")
    public List<Visita> listarPorIdoso(@PathVariable Long idosoId) {
        return service.listarPorIdoso(idosoId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Visita> atualizar(@PathVariable Long id, @RequestBody Visita dados) {
        return service.atualizar(id, dados)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!service.excluir(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sem-visita")
    public List<Map<String, Object>> idososSemVisita(@RequestParam(defaultValue = "30") int dias) {
        return service.idososSemVisita(dias);
    }
}
