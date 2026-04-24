package com.assisconnect.controller;

import com.assisconnect.entity.Medicamento;
import com.assisconnect.repository.MedicamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/medicamentos")
@CrossOrigin(origins = "*")
public class MedicamentoController {

    @Autowired
    private MedicamentoRepository repository;

    @PostMapping
    public Medicamento cadastrar(@RequestBody Medicamento medicamento) {
        if (medicamento.getDataCadastro() == null) {
            medicamento.setDataCadastro(LocalDate.now());
        }
        return repository.save(medicamento);
    }

    @GetMapping("/idoso/{idosoId}")
    public List<Medicamento> listarPorIdoso(@PathVariable Long idosoId,
                                            @RequestParam(required = false, defaultValue = "false") boolean apenasAtivos) {
        if (apenasAtivos) {
            return repository.findByIdosoIdAndAtivoTrueOrderByNomeAsc(idosoId);
        }
        return repository.findByIdosoIdOrderByNomeAsc(idosoId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicamento> buscarPorId(@PathVariable Long id) {
        Optional<Medicamento> med = repository.findById(id);
        return med.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicamento> atualizar(@PathVariable Long id, @RequestBody Medicamento dados) {
        return repository.findById(id).map(m -> {
            m.setNome(dados.getNome());
            m.setDosagem(dados.getDosagem());
            m.setHorarios(dados.getHorarios());
            m.setFrequencia(dados.getFrequencia());
            m.setObservacoes(dados.getObservacoes());
            m.setAtivo(dados.isAtivo());
            return ResponseEntity.ok(repository.save(m));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
