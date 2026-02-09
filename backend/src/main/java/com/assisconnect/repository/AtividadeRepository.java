package com.assisconnect.repository;

import com.assisconnect.entity.Atividade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AtividadeRepository extends JpaRepository<Atividade, Long> {

    List<Atividade> findByDataRegistro(String dataRegistro);
    List<Atividade> findByDataRegistroAndNome(String dataRegistro, String nome);
}
