package com.assisconnect.repository;

import com.assisconnect.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    Optional<Usuario> findByUsuario(String usuario);
    Optional<Usuario> findByEmail(String email);
}
