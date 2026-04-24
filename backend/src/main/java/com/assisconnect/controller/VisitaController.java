package com.assisconnect.controller;

import com.assisconnect.entity.Idoso;
import com.assisconnect.entity.Visita;
import com.assisconnect.repository.IdosoRepository;
import com.assisconnect.repository.VisitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/visitas")
@CrossOrigin(origins = "*")
public class VisitaController {

    @Autowired
    private VisitaRepository visitaRepository;

    @Autowired
    private IdosoRepository idosoRepository;

    @PostMapping
    public Visita cadastrar(@RequestBody Visita visita) {
        if (visita.getDataVisita() == null) {
            visita.setDataVisita(LocalDate.now());
        }
        return visitaRepository.save(visita);
    }

    @GetMapping("/idoso/{idosoId}")
    public List<Visita> listarPorIdoso(@PathVariable Long idosoId) {
        return visitaRepository.findByIdosoIdOrderByDataVisitaDesc(idosoId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Visita> atualizar(@PathVariable Long id, @RequestBody Visita dados) {
        return visitaRepository.findById(id).map(v -> {
            v.setDataVisita(dados.getDataVisita());
            v.setNomeVisitante(dados.getNomeVisitante());
            v.setParentesco(dados.getParentesco());
            v.setObservacoes(dados.getObservacoes());
            return ResponseEntity.ok(visitaRepository.save(v));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!visitaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        visitaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sem-visita")
    public List<Map<String, Object>> idososSemVisita(@RequestParam(defaultValue = "30") int dias) {
        LocalDate dataLimite = LocalDate.now().minusDays(dias);
        List<Long> idososComVisita = visitaRepository.findIdososComVisitaRecente(dataLimite);
        Set<Long> comVisitaSet = new HashSet<>(idososComVisita);

        List<Idoso> todos = idosoRepository.findAll();
        return todos.stream()
                .filter(i -> !i.isInativo() && !i.isFalecido())
                .filter(i -> !comVisitaSet.contains(i.getId()))
                .map(i -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", i.getId());
                    map.put("nome", i.getNome());
                    map.put("fotoUrl", i.getFotoUrl());
                    Optional<Visita> ultima = visitaRepository.findTop1ByIdosoIdOrderByDataVisitaDesc(i.getId());
                    map.put("ultimaVisita", ultima.map(v -> v.getDataVisita().toString()).orElse(null));
                    return map;
                })
                .collect(Collectors.toList());
    }
}
