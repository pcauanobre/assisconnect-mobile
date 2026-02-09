package com.assisconnect.controller;

import com.assisconnect.dto.IdosoDTO;
import com.assisconnect.entity.Idoso;
import com.assisconnect.repository.IdosoRepository;
import com.assisconnect.service.IdosoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/idosos")
@CrossOrigin(origins = "*")
public class IdosoController {

    @Autowired
    private IdosoService service;

    @Autowired
    private IdosoRepository idosoRepository;

    @PostMapping
    public Idoso cadastrar(@RequestBody IdosoDTO dto) {
        return service.salvar(dto); // ✅ o campo inativo e falecido já devem estar sendo salvos via DTO
    }

    @GetMapping
    public List<IdosoDTO> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public IdosoDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public Idoso atualizar(@PathVariable Long id, @RequestBody IdosoDTO dto) {
        return service.atualizar(id, dto); // ✅ atualização já inclui os campos novos
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }

    @GetMapping("/quantidade-por-mes")
    public ResponseEntity<Map<String, Object>> getQuantidadePorMes(
            @RequestParam int ano,
            @RequestParam int mes
    ) {
        try {
            int quantidade = idosoRepository.contarPorMesEAno(ano, mes);
            Map<String, Object> response = new HashMap<>();
            response.put("quantidade", quantidade);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("erro", "Falha ao consultar quantidade."));
        }
    }

    @GetMapping("/aniversariantes")
    public List<IdosoDTO> aniversariantesHoje() {
        return service.obterAniversariantesHoje();
    }

    @GetMapping("/quantidade")
    public long contar() {
        return idosoRepository.count();
    }

    @GetMapping("/aniversariantes-do-mes")
    public List<IdosoDTO> aniversariantesDoMes() {
        return service.obterAniversariantesDoMes();
    }
}
