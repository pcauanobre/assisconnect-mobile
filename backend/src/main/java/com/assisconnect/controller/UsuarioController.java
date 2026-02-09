package com.assisconnect.controller;

import com.assisconnect.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    // ✅ Retorna a quantidade total de usuários
    @GetMapping("/quantidade")
    public long totalUsuarios() {
        return repository.count();
    }

    // ✅ Retorna os dados do usuário logado (sem senha)
    @GetMapping("/perfil/{usuario}")
    public ResponseEntity<?> obterPerfil(@PathVariable String usuario) {
        return repository.findByUsuario(usuario)
                .map(u -> {
                    u.setSenha(null);
                    return ResponseEntity.ok(u);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }
}
