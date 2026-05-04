package com.assisconnect.service;

import com.assisconnect.entity.Usuario;
import com.assisconnect.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public long contar() {
        return repository.count();
    }

    public Optional<Usuario> buscarPerfil(String usuario) {
        return repository.findByUsuario(usuario);
    }
}
