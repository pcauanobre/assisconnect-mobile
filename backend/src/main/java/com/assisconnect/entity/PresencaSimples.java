package com.assisconnect.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class PresencaSimples {

    private String nome;
    private String data;
    private String hora;
    private String fotoUrl; // <-- ADICIONADO

    public PresencaSimples() {}

    public PresencaSimples(String nome, String data, String hora, String fotoUrl) {
        this.nome = nome;
        this.data = data;
        this.hora = hora;
        this.fotoUrl = fotoUrl; // <-- ADICIONADO
    }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }

    public String getHora() { return hora; }
    public void setHora(String hora) { this.hora = hora; }

    public String getFotoUrl() { return fotoUrl; } // <-- GETTER
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; } // <-- SETTER
}
