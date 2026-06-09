import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface ProblemDetails {
  title?: string;
  detail?: string;
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  getMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Ocorreu um erro inesperado. Tente novamente.';
    }

    if (error.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique se a API está online.';
    }

    const body = error.error as ProblemDetails | null;

    if (body?.errors) {
      const firstField = Object.keys(body.errors)[0];
      const firstMessage = firstField ? body.errors[firstField]?.[0] : undefined;
      if (firstMessage) {
        return firstMessage;
      }
    }

    if (body?.detail) {
      return body.detail;
    }

    if (body?.message) {
      return body.message;
    }

    return this.getDefaultMessage(error.status, body?.code);
  }

  isUnauthorized(error: unknown): boolean {
    return error instanceof HttpErrorResponse && error.status === 401;
  }

  private getDefaultMessage(status: number, code?: string): string {
    if (code) {
      const mapped = this.mapCode(code);
      if (mapped) {
        return mapped;
      }
    }

    switch (status) {
      case 400:
        return 'Dados inválidos. Verifique os campos e tente novamente.';
      case 401:
        return 'Sessão expirada ou credenciais inválidas. Faça login novamente.';
      case 403:
        return 'Você não tem permissão para esta ação.';
      case 404:
        return 'Recurso não encontrado.';
      case 409:
        return 'Conflito ao processar a solicitação.';
      case 422:
        return 'Não foi possível processar os dados enviados.';
      case 500:
        return 'Erro interno no servidor. Tente novamente em instantes.';
      default:
        return 'Não foi possível completar a operação. Tente novamente.';
    }
  }

  private mapCode(code: string): string | null {
    const codes: Record<string, string> = {
      'Auth.EmailExists': 'Este e-mail já está cadastrado.',
      'Auth.InvalidCredentials': 'E-mail ou senha incorretos.',
      'Auth.Unauthorized': 'Faça login para continuar.',
      'Auth.Forbidden': 'Você não tem permissão para esta ação.',
      'Cart.InsufficientStock': 'Estoque insuficiente para a quantidade solicitada.',
      'Cart.ProductNotFound': 'Produto não encontrado ou indisponível.',
      'Cart.ItemNotFound': 'Item não encontrado no carrinho.',
      'Catalog.ProductNotFound': 'Produto não encontrado.',
      'Orders.EmptyCart': 'Seu carrinho está vazio.',
      'Validation.Error': 'Um ou mais campos são inválidos.'
    };

    return codes[code] ?? null;
  }
}
