package com.assisconnect.controller;

import com.assisconnect.dto.CardapioDTO;
import com.assisconnect.entity.Cardapio;
import com.assisconnect.service.CardapioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cardapio")
@CrossOrigin(origins = "*")
public class CardapioController {

    @Autowired
    private CardapioService cardapioService;

    // ✅ Corrigido: agora usa o método que remove o antigo e salva o novo
    @PutMapping("/atualizar")
    public void atualizarCardapio(@RequestBody List<CardapioDTO> refeicoes) {
        cardapioService.atualizarLista(refeicoes);
    }

    // ✅ Listar todos os registros
    @GetMapping
    public List<Cardapio> listarTodos() {
        return cardapioService.listarTudo();
    }

    // ✅ Buscar cardápio de hoje (café, almoço, jantar)
    @GetMapping("/hoje")
    public Map<String, Cardapio> buscarCardapioDeHoje() {
        return cardapioService.buscarCardapioDeHoje();
    }
}
