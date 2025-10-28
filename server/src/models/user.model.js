import Joi from "joi";

class UsuarioModel {
  constructor(data = {}) {
    const { error, value } = UsuarioModel.schema.validate(data, {
      abortEarly: false,
    });

    if (error) {
      throw new Error(
        `Erro de validação: ${error.details.map((d) => d.message).join(", ")}`
      );
    }

    this.nome = value.nome;
    this.data_nascimento = value.data_nascimento;
    this.idade = value.idade;
    this.cpf = value.cpf;
    this.email = value.email;
    this.telefone = value.telefone;
    this.idosoRef = value.idosoRef; // ✅ referencia correta para pessoaIdosa
    this.createdAt = value.createdAt;
  }

  toJSON() {
    return {
      nome: this.nome,
      data_nascimento: this.data_nascimento,
      idade: this.idade,
      cpf: this.cpf,
      email: this.email,
      telefone: this.telefone,
      idosoRef: this.idosoRef,
      createdAt: this.createdAt,
    };
  }

  static get schema() {
    return Joi.object({
      nome: Joi.string().required(),

      data_nascimento: Joi.date().less("now").required(),

      idade: Joi.number().integer().min(0).optional(),

      cpf: Joi.string()
        .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
        .required(),

      email: Joi.string().email({ tlds: { allow: false } }).required(),

      telefone: Joi.string()
        .pattern(/^\+55\s\d{2}\s9?\d{4}-\d{4}$/)
        .required(),

      idosoRef: Joi.string()
        .pattern(/^pessoaIdosa\/[A-Za-z0-9_-]+$/)
        .required(),

      createdAt: Joi.date().default(() => new Date()),
    });
  }
}

export default UsuarioModel;
