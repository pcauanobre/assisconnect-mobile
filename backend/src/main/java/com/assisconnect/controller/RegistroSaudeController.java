package com.assisconnect.controller;

import com.assisconnect.entity.RegistroSaude;
import com.assisconnect.repository.RegistroSaudeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/saude")
@CrossOrigin(origins = "*")
public class RegistroSaudeController {

    @Autowired
    private RegistroSaudeRepository repository;

    @PostMapping
    public RegistroSaude cadastrar(@RequestBody RegistroSaude registro) {
        if (registro.getData() == null) {
            registro.setData(LocalDate.now());
        }
        return repository.save(registro);
    }

    @GetMapping("/idoso/{idosoId}")
    public List<RegistroSaude> listarPorIdoso(@PathVariable Long idosoId) {
        return repository.findByIdosoIdOrderByDataDesc(idosoId);
    }

    @GetMapping("/idoso/{idosoId}/ultimo")
    public ResponseEntity<RegistroSaude> ultimoRegistro(@PathVariable Long idosoId) {
        Optional<RegistroSaude> ultimo = repository.findTop1ByIdosoIdOrderByDataDesc(idosoId);
        return ultimo.map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroSaude> atualizar(@PathVariable Long id, @RequestBody RegistroSaude dados) {
        return repository.findById(id).map(r -> {
            r.setData(dados.getData());
            r.setPeso(dados.getPeso());
            r.setPressaoSistolica(dados.getPressaoSistolica());
            r.setPressaoDiastolica(dados.getPressaoDiastolica());
            r.setTemperatura(dados.getTemperatura());
            r.setGlicemia(dados.getGlicemia());
            r.setObservacoes(dados.getObservacoes());
            return ResponseEntity.ok(repository.save(r));
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
