package com.assisconnect.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cardapio")
public class Cardapio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dia;
    private String tipo;
    private String prato;
    private int calorias;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDia() { return dia; }
    public void setDia(String dia) { this.dia = dia; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getPrato() { return prato; }
    public void setPrato(String prato) { this.prato = prato; }

    public int getCalorias() { return calorias; }
    public void setCalorias(int calorias) { this.calorias = calorias; }
}
