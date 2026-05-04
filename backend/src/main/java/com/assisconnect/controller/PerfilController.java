package com.assisconnect.controller;

import com.assisconnect.entity.Usuario;
import com.assisconnect.service.PerfilService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/perfil")
@CrossOrigin(origins = "*")
public class PerfilController {

    private final PerfilService service;

    public PerfilController(PerfilService service) {
        this.service = service;
    }

    @PutMapping(value = "/{usuario}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Usuario> atualizarMultipart(
            @PathVariable String usuario,
            @RequestPart("nome") String nome,
            @RequestPart("email") String email,
            @RequestPart("telefone") String telefone,
            @RequestPart(value = "foto", required = false) MultipartFile foto) throws IOException {
        return service.atualizarComFoto(usuario, nome, email, telefone, foto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{usuario}")
    public ResponseEntity<Usuario> atualizarJson(
            @PathVariable String usuario,
            @RequestBody Map<String, String> dados) {
        return service.atualizarJson(usuario, dados)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{usuario}")
    public ResponseEntity<Usuario> buscar(@PathVariable String usuario) {
        return service.buscar(usuario)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
