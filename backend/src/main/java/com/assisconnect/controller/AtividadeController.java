package com.assisconnect.controller;

import com.assisconnect.entity.Atividade;
import com.assisconnect.repository.AtividadeRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/atividades")
@CrossOrigin(origins = "*")
public class AtividadeController {

    private final AtividadeRepository repository;

    public AtividadeController(AtividadeRepository repository) {
        this.repository = repository;
    }

    // ✅ Criar ou atualizar atividade
    @PostMapping
    public Atividade salvar(@RequestBody Atividade novaAtividade) {
        if (novaAtividade.getId() != null) {
            Atividade existente = repository.findById(novaAtividade.getId())
                    .orElseThrow(() -> new RuntimeException("Atividade não encontrada"));
            existente.setPresentes(novaAtividade.getPresentes());
            existente.setHoraRegistro(novaAtividade.getHoraRegistro());
            return repository.save(existente);
        }

        List<Atividade> existentes = repository.findByDataRegistroAndNome(novaAtividade.getDataRegistro(), novaAtividade.getNome());

        if (!existentes.isEmpty()) {
            Atividade existente = existentes.get(existentes.size() - 1);

            for (var novaPresenca : novaAtividade.getPresentes()) {
                boolean jaExiste = existente.getPresentes().stream()
                        .anyMatch(p -> p.getNome().equalsIgnoreCase(novaPresenca.getNome()));
                if (!jaExiste) {
                    existente.getPresentes().add(novaPresenca);
                }
            }

            return repository.save(existente);
        }

        return repository.save(novaAtividade);
    }

    // ✅ Listar por data ou nome
    @GetMapping
    public List<Atividade> listarPorDataOuTodas(
            @RequestParam(required = false) String data,
            @RequestParam(required = false) String nome
    ) {
        if (data != null && nome != null) {
            return repository.findByDataRegistroAndNome(data, nome);
        } else if (data != null) {
            return repository.findByDataRegistro(data);
        } else {
            return repository.findAll();
        }
    }

    // ✅ Buscar por ID
    @GetMapping("/{id}")
    public Atividade buscarPorId(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Atividade não encontrada"));
    }

    // ✅ NOVO ENDPOINT: Atividades do dia
    @GetMapping("/hoje")
    public List<Atividade> atividadesDeHoje() {
        String hoje = LocalDate.now().toString(); // yyyy-MM-dd
        return repository.findByDataRegistro(hoje);
    }
}
