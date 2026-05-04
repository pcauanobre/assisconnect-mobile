package com.assisconnect.controller;

import com.assisconnect.entity.Medicamento;
import com.assisconnect.service.MedicamentoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicamentos")
@CrossOrigin(origins = "*")
public class MedicamentoController {

    private final MedicamentoService service;

    public MedicamentoController(MedicamentoService service) {
        this.service = service;
    }

    @PostMapping
    public Medicamento cadastrar(@RequestBody Medicamento medicamento) {
        return service.cadastrar(medicamento);
    }

    @GetMapping("/idoso/{idosoId}")
    public List<Medicamento> listarPorIdoso(@PathVariable Long idosoId,
                                             @RequestParam(required = false, defaultValue = "false") boolean apenasAtivos) {
        return service.listarPorIdoso(idosoId, apenasAtivos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicamento> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicamento> atualizar(@PathVariable Long id, @RequestBody Medicamento dados) {
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
