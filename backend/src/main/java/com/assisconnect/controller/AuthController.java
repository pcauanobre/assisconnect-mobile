package com.assisconnect.controller;

import com.assisconnect.entity.Usuario;
import com.assisconnect.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /* ==========================================================
       REGISTRO  – não permite usuário duplicado
       ========================================================== */
    @PostMapping("/register")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {

        String login = (usuario.getUsuario() == null) ? "" : usuario.getUsuario().trim();
        if (login.isBlank() || usuario.getSenha() == null || usuario.getSenha().isBlank())
            return ResponseEntity.badRequest().body("Usuário e senha são obrigatórios");

        // PK = usuario
        if (usuarioRepository.existsById(login))
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Usuário já cadastrado");

        usuario.setUsuario(login);
        Usuario salvo = usuarioRepository.save(usuario);
        salvo.setSenha(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    /* ==========================================================
       LOGIN (EMAIL + SENHA)
       payload esperado:
       { "email": "...", "senha": "..." }
       ========================================================== */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> cred) {

        String email = cred.get("email") == null ? "" : cred.get("email").trim();
        String senha = cred.get("senha") == null ? "" : cred.get("senha").trim();

        if (email.isBlank() || senha.isBlank())
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("erro");

        Optional<Usuario> opt = usuarioRepository.findByEmail(email);
        if (opt.isEmpty())
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("erro");

        Usuario u = opt.get();
        String dbSenha = (u.getSenha() == null) ? "" : u.getSenha().trim();

        if (!dbSenha.equals(senha))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("erro");

        // DTO sem senha
        Usuario dto = new Usuario();
        dto.setUsuario(u.getUsuario());
        dto.setEmail(u.getEmail());
        dto.setNome(u.getNome());
        dto.setTelefone(u.getTelefone());
        dto.setFotoUrl(u.getFotoUrl());
        dto.setAdministrador(u.isAdministrador());

        return ResponseEntity.ok(dto);
    }

    /* ==========================================================
       RESETAR SENHA (por email)
       payload:
       { "email": "...", "novaSenha": "..." }
       ========================================================== */
    @PostMapping("/resetar-senha")
    public ResponseEntity<String> resetarSenha(@RequestBody Map<String, String> dados) {

        String email     = dados.get("email") == null ? "" : dados.get("email").trim();
        String novaSenha = dados.get("novaSenha") == null ? "" : dados.get("novaSenha").trim();

        if (email.isBlank() || novaSenha.isBlank())
            return ResponseEntity.badRequest().body("Email e novaSenha são obrigatórios");

        return usuarioRepository.findByEmail(email)
                .map(u -> {
                    u.setSenha(novaSenha);
                    usuarioRepository.save(u);
                    return ResponseEntity.ok("Senha atualizada com sucesso");
                })
                .orElseGet(() -> ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Usuário não encontrado"));
    }
}
