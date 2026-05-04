package com.assisconnect.service;

import com.assisconnect.entity.Usuario;
import com.assisconnect.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class PerfilService {

    private final UsuarioRepository repository;

    public PerfilService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public Optional<Usuario> buscar(String usuario) {
        return repository.findById(usuario);
    }

    public Optional<Usuario> atualizarComFoto(String usuario, String nome, String email,
                                               String telefone, MultipartFile foto) throws IOException {
        Optional<Usuario> opt = repository.findById(usuario);
        if (opt.isEmpty()) return Optional.empty();

        Usuario u = opt.get();
        u.setNome(nome);
        u.setEmail(email);
        u.setTelefone(telefone);

        if (foto != null && !foto.isEmpty()) {
            String ext = getExt(foto.getOriginalFilename());
            Path uploadDir = Paths.get("src/main/resources/static/uploads");
            Files.createDirectories(uploadDir);
            Path destino = uploadDir.resolve(usuario + ext);
            Files.write(destino, foto.getBytes(),
                    StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            u.setFotoUrl("/uploads/" + destino.getFileName());
        }

        return Optional.of(repository.save(u));
    }

    public Optional<Usuario> atualizarJson(String usuario, Map<String, String> dados) {
        Optional<Usuario> opt = repository.findById(usuario);
        if (opt.isEmpty()) return Optional.empty();

        Usuario u = opt.get();
        u.setNome(dados.getOrDefault("nome", u.getNome()));
        u.setEmail(dados.getOrDefault("email", u.getEmail()));
        u.setTelefone(dados.getOrDefault("telefone", u.getTelefone()));

        if (dados.containsKey("fotoBase64")) {
            String base64 = dados.get("fotoBase64");
            if (base64 != null && base64.startsWith("data:image/")) {
                u.setFotoUrl(base64);
            }
        }

        return Optional.of(repository.save(u));
    }

    private String getExt(String filename) {
        if (filename == null) return "";
        int i = filename.lastIndexOf('.');
        return i >= 0 ? filename.substring(i) : "";
    }
}
