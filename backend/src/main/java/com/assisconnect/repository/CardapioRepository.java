package com.assisconnect.repository;

import com.assisconnect.entity.Cardapio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CardapioRepository extends JpaRepository<Cardapio, Long> {

    // ✅ Buscar todas as refeições de um dia
    List<Cardapio> findByDia(String dia);

    // ✅ Apagar todas as refeições de um dia (usado na atualização)
    void deleteByDia(String dia);

    // ✅ Buscar uma refeição específica por dia e tipo (ex: Segunda + cafe)
    Optional<Cardapio> findByDiaAndTipo(String dia, String tipo);
}
