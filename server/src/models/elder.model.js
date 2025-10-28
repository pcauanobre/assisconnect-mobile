import Joi from "joi"; // joi utilizaod para validação

class PessoaIdosaModel {
  // classe do modelo
  constructor(data = {}) {
    // validação com schema Joi
    const { error, value } = PessoaIdosaModel.schema.validate(data, {
      abortEarly: false,
    });

    if (error) {
      throw new Error(
        `Erro de validação: ${error.details.map((d) => d.message).join(", ")}`
      );
    }

    // atribuição dos valores validos
    this.nome = value.nome;
    this.idade = value.idade;
    this.cpf = value.cpf;
    this.peso_kg = value.peso_kg;
    this.altura_cm = value.altura_cm;
    this.genero = value.genero;
    this.condicoes = value.condicoes;
    this.endereco = value.endereco;
    this.medicamentos = value.medicamentos;
    this.responsavel = value.responsavel;
    this.humor = value.humor;
    this.alimentacao = value.alimentacao;
    this.comentario = value.comentario;
    this.createdAt = value.createdAt;
  }

  // converte para JSON (útil para salvar no Firestore ou enviar por API)
  toJSON() {
    return {
      nome: this.nome,
      idade: this.idade,
      cpf: this.cpf,
      peso_kg: this.peso_kg,
      altura_cm: this.altura_cm,
      genero: this.genero,
      condicoes: this.condicoes,
      endereco: this.endereco,
      medicamentos: this.medicamentos,
      responsavel: this.responsavel,
      humor: this.humor,
      alimentacao: this.alimentacao,
      comentario: this.comentario,
      createdAt: this.createdAt,
    };
  }

  // schema Joi (required significa obrigatório)
  static get schema() {
    return Joi.object({
      nome: Joi.string().required(),
      idade: Joi.number().integer().min(0).required(),
      cpf: Joi.string()
        .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/) // formato 000.000.000-00
        .required(),
      peso_kg: Joi.number().positive().required(), // apenas em kg
      altura_cm: Joi.number().positive().required(), // apenas em cm
      genero: Joi.string().valid("Feminino", "Masculino", "Outro").required(), // deixei só esses 3 mas podem add mais se quiser
      condicoes: Joi.array().items(Joi.string()).default([]), // aqui é um array, cuidado ao tratar

      endereco: Joi.object({
        // objeto
        cep: Joi.string()
          .pattern(/^\d{5}-\d{3}$/)
          .required(), // mantem padrão de 5-3 de CEP
        cidade: Joi.string().required(),
        estado: Joi.string().length(2).uppercase().required(), // padrão Uppercase com 2 letras (ex: CE)
        rua: Joi.string().required(),
      }).required(),

      medicamentos: Joi.object({
        // objeto
        nome: Joi.string().required(),
        dosagem_mg: Joi.number().positive().required(), // apenas em mg
        frequencia_dia: Joi.number().integer().min(1).required(), // apenas por dia (ex: 2 significa 2 vezes por dia)
      }).required(),

      responsavel: Joi.string().required(),
      humor: Joi.number().min(1).max(5).required(),
      alimentacao: Joi.string().required(),
      comentario: Joi.string(),
      createdAt: Joi.date().default(() => new Date()),
    });
  }
}

export default PessoaIdosaModel;
// nota: foi nesse commit que adicionei o JOI
// mudei o export
