import Joi from "joi"; // Joi utilizado para validação

class UsuarioModel {
  constructor(data = {}) {
    // validação com schema Joi
    const { error, value } = UsuarioModel.schema.validate(data, {
      abortEarly: false,
    });

    if (error) {
      throw new Error(
        `Erro de validação: ${error.details.map((d) => d.message).join(", ")}`
      );
    }

    // atribuição dos valores validados
    this.nome = value.nome;
    this.data_nascimento = value.data_nascimento;
    this.idade = value.idade; // pode ser passado manualmente ou calculado
    this.cpf = value.cpf;
    this.email = value.email;
    this.telefone = value.telefone;
    this.idosoRef = value.idosoRef; // pega diretamente do valor validado
    this.createdAt = value.createdAt;
  }

  // converte para JSON (para salvar no Firestore ou enviar por API)
  toJSON() {
    return {
      nome: this.nome,
      data_nascimento: this.data_nascimento,
      idade: this.idade,
      cpf: this.cpf,
      email: this.email,
      telefone: this.telefone,
      idosoRef: this.idosoRef, // mantém referência direta
      createdAt: this.createdAt,
    };
  }

  // schema Joi para validação
  static get schema() {
    return Joi.object({
      nome: Joi.string().required(),

      data_nascimento: Joi.date()
        .less("now")
        .required(),

      // idade pode ser derivada da data de nascimento ou passada diretamente
      idade: Joi.number()
        .integer()
        .min(0)
        .optional(),

      cpf: Joi.string()
        .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/) // formato 000.000.000-00
        .required(),

      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),

      telefone: Joi.string()
        .pattern(/^\+55\s\d{2}\s9?\d{4}-\d{4}$/)
        .required(), // padrão de número (+55 12 3456-7890)

      idosoRef: Joi.string()
        .pattern(/^pessoaIdosa\/[A-Za-z0-9_-]+$/) // caminho do doc
        .required()
        .messages({
          "string.pattern.base": "idosoRef deve ser um caminho válido: pessoaIdosa/{id}",
        }),

      createdAt: Joi.date().default(() => new Date()),
    });
  }
}

export default UsuarioModel;
