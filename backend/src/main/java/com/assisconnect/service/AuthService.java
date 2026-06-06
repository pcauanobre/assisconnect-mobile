package com.assisconnect.service;

import com.assisconnect.entity.Usuario;
import com.assisconnect.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario registrar(Usuario usuario) {
        String login = (usuario.getUsuario() == null) ? "" : usuario.getUsuario().trim();
        String senha = (usuario.getSenha() == null) ? "" : usuario.getSenha().trim();
        if (login.isBlank() || senha.isBlank()) {
            throw new IllegalArgumentException("Usuário e senha são obrigatórios");
        }
        if (usuarioRepository.existsById(login)) {
            throw new IllegalStateException("Usuário já cadastrado");
        }
        usuario.setUsuario(login);
        usuario.setSenha(senha);
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> login(String email, String senha) {
        Optional<Usuario> opt = usuarioRepository.findByEmail(email);
        if (opt.isEmpty()) return Optional.empty();

        Usuario u = opt.get();
        String dbSenha = u.getSenha() == null ? "" : u.getSenha().trim();
        String inputSenha = senha == null ? "" : senha.trim();
        if (!dbSenha.equals(inputSenha)) return Optional.empty();

        return Optional.of(u);
    }

    public boolean resetarSenha(String email, String novaSenha) {
        return usuarioRepository.findByEmail(email).map(u -> {
            u.setSenha(novaSenha);
            usuarioRepository.save(u);
            return true;
        }).orElse(false);
    }
}
