package com.assisconnect.service;

import com.assisconnect.dto.CardapioDTO;
import com.assisconnect.entity.Cardapio;
import com.assisconnect.repository.CardapioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class CardapioService {

    @Autowired
    private CardapioRepository cardapioRepository;

    // ✅ Agora com transação ativa para permitir remoções seguras
    @Transactional
    public void atualizarLista(List<CardapioDTO> lista) {
        if (lista == null || lista.isEmpty()) return;

        String dia = lista.get(0).getDia();

        if (dia == null || dia.isBlank()) {
            throw new RuntimeException("Dia inválido recebido.");
        }

        // Remove todas as refeições desse dia antes de salvar as novas
        cardapioRepository.deleteByDia(dia);

        List<Cardapio> novos = new ArrayList<>();
        for (CardapioDTO dto : lista) {
            Cardapio novo = new Cardapio();
            novo.setDia(dto.getDia());
            novo.setTipo(dto.getTipo());
            novo.setPrato(dto.getPrato());
            novo.setCalorias(dto.getCalorias());
            novos.add(novo);
        }

        cardapioRepository.saveAll(novos);
    }

    // Versão antiga: atualiza ou cria item por item
    public void salvarLista(List<CardapioDTO> lista) {
        for (CardapioDTO dto : lista) {
            Optional<Cardapio> existente = cardapioRepository.findByDiaAndTipo(dto.getDia(), dto.getTipo());

            if (existente.isPresent()) {
                Cardapio c = existente.get();
                c.setPrato(dto.getPrato());
                c.setCalorias(dto.getCalorias());
                cardapioRepository.save(c);
            } else {
                Cardapio novo = new Cardapio();
                novo.setDia(dto.getDia());
                novo.setTipo(dto.getTipo());
                novo.setPrato(dto.getPrato());
                novo.setCalorias(dto.getCalorias());
                cardapioRepository.save(novo);
            }
        }
    }

    // Listar todos os registros de cardápio
    public List<Cardapio> listarTudo() {
        return cardapioRepository.findAll();
    }

    // Buscar cardápio do dia atual (ex: Segunda, Terça...)
    public Map<String, Cardapio> buscarCardapioDeHoje() {
        String diaDaSemana = LocalDate.now()
                .getDayOfWeek()
                .getDisplayName(TextStyle.FULL, new Locale("pt", "BR"));

        diaDaSemana = diaDaSemana.substring(0, 1).toUpperCase() + diaDaSemana.substring(1).split("-")[0];

        List<Cardapio> refeicoes = cardapioRepository.findByDia(diaDaSemana);

        Map<String, Cardapio> map = new HashMap<>();
        for (Cardapio item : refeicoes) {
            map.put(item.getTipo(), item);
        }
        return map;
    }
}
