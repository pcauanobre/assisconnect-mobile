package com.assisconnect.controller;

import com.assisconnect.entity.Usuario;
import com.assisconnect.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;

@RestController
@RequestMapping("/perfil")
@CrossOrigin(origins = "*")
public class PerfilController {

    @Autowired
    private UsuarioRepository repo;

    /* ============================================================
       PUT /perfil/{usuario} – método antigo (opcional)
       Recebe multipart/form-data com arquivo e campos separados
       ============================================================ */
    @PutMapping(value = "/{usuario}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Usuario> atualizarMultipart(
            @PathVariable String usuario,
            @RequestPart("nome")     String nome,
            @RequestPart("email")    String email,
            @RequestPart("telefone") String telefone,
            @RequestPart(value = "foto", required = false) MultipartFile foto)
            throws IOException {

        Usuario u = repo.findById(usuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

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

            // Apenas se ainda quiser servir por URL pública (modo antigo)
            u.setFotoUrl("/uploads/" + destino.getFileName());
        }

        return ResponseEntity.ok(repo.save(u));
    }

    /* ============================================================
       POST /perfil/{usuario} – método principal
       Recebe JSON com imagem em base64 (campo fotoBase64)
       ============================================================ */
    @PostMapping("/{usuario}")
    public ResponseEntity<Usuario> atualizarJson(
            @PathVariable String usuario,
            @RequestBody Map<String, String> dados) {

        Usuario u = repo.findById(usuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        u.setNome(dados.getOrDefault("nome", u.getNome()));
        u.setEmail(dados.getOrDefault("email", u.getEmail()));
        u.setTelefone(dados.getOrDefault("telefone", u.getTelefone()));

        if (dados.containsKey("fotoBase64")) {
            String base64 = dados.get("fotoBase64");
            if (base64 != null && base64.startsWith("data:image/")) {
                u.setFotoUrl(base64);  // Aqui o base64 vai direto para o banco
            }
        }

        return ResponseEntity.ok(repo.save(u));
    }

    /* ============================================================
       GET /perfil/{usuario} – retorna dados para exibir no front
       ============================================================ */
    @GetMapping("/{usuario}")
    public Usuario buscar(@PathVariable String usuario) {
        return repo.findById(usuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    /* ============================================================
       Utilitário: extrair extensão de arquivo (opcional)
       ============================================================ */
    private String getExt(String filename) {
        int i = filename.lastIndexOf('.');
        return i >= 0 ? filename.substring(i) : "";
    }
}
