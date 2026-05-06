package com.assisconnect.service;

import com.assisconnect.entity.Usuario;
import com.assisconnect.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
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

    public List<Usuario> listarTodos() {
        List<Usuario> lista = repository.findAll();
        lista.forEach(u -> u.setSenha(null));
        return lista;
    }

    public Optional<Usuario> atualizar(String usuario, Map<String, Object> dados) {
        return repository.findByUsuario(usuario).map(u -> {
            if (dados.containsKey("administrador")) {
                u.setAdministrador(Boolean.TRUE.equals(dados.get("administrador")));
            }
            if (dados.containsKey("nome") && dados.get("nome") != null) {
                u.setNome((String) dados.get("nome"));
            }
            if (dados.containsKey("email") && dados.get("email") != null) {
                u.setEmail((String) dados.get("email"));
            }
            Usuario salvo = repository.save(u);
            salvo.setSenha(null);
            return salvo;
        });
    }

    public void deletar(String usuario) {
        repository.deleteById(usuario);
    }
}
