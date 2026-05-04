package com.assisconnect.controller;

import com.assisconnect.entity.Usuario;
import com.assisconnect.service.AuthService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            Usuario salvo = authService.registrar(usuario);
            salvo.setSenha(null);
            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> cred) {
        String email = cred.getOrDefault("email", "").trim();
        String senha = cred.getOrDefault("senha", "").trim();

        if (email.isBlank() || senha.isBlank())
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("erro");

        Optional<Usuario> resultado = authService.login(email, senha);
        if (resultado.isEmpty())
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("erro");

        Usuario u = resultado.get();
        Usuario dto = new Usuario();
        dto.setUsuario(u.getUsuario());
        dto.setEmail(u.getEmail());
        dto.setNome(u.getNome());
        dto.setTelefone(u.getTelefone());
        dto.setFotoUrl(u.getFotoUrl());
        dto.setAdministrador(u.isAdministrador());

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/resetar-senha")
    public ResponseEntity<String> resetarSenha(@RequestBody Map<String, String> dados) {
        String email = dados.getOrDefault("email", "").trim();
        String novaSenha = dados.getOrDefault("novaSenha", "").trim();

        if (email.isBlank() || novaSenha.isBlank())
            return ResponseEntity.badRequest().body("Email e novaSenha são obrigatórios");

        boolean sucesso = authService.resetarSenha(email, novaSenha);
        if (!sucesso)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado");

        return ResponseEntity.ok("Senha atualizada com sucesso");
    }
}
