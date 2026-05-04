package com.assisconnect.controller;

import com.assisconnect.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping("/quantidade")
    public long totalUsuarios() {
        return service.contar();
    }

    @GetMapping("/perfil/{usuario}")
    public ResponseEntity<?> obterPerfil(@PathVariable String usuario) {
        return service.buscarPerfil(usuario)
                .map(u -> {
                    u.setSenha(null);
                    return ResponseEntity.ok(u);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }
}
