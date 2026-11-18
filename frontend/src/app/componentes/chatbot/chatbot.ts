import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ChatService } from '../../servicios/chat';
import { mensajeDeApi } from '../../util';

interface Mensaje {
  autor: 'vos' | 'academia';
  texto: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.html',
})
export class Chatbot {
  private chatService = inject(ChatService);

  mensajes: Mensaje[] = [
    {
      autor: 'academia',
      texto: 'Preguntame por los cursos y las alumnas. Por ejemplo: ¿qué cursos hay?',
    },
  ];
  enviando = false;
  error = '';

  sugerencias = [
    '¿Qué cursos hay?',
    '¿Quiénes son arqueras?',
    '¿Qué alumnas están en mediocampo competitivo?',
  ];

  enviar(valor?: string) {
    const mensaje = (valor ?? '').trim();
    if (!mensaje || this.enviando) return;

    this.error = '';
    this.mensajes = [...this.mensajes, { autor: 'vos', texto: mensaje }];
    this.enviando = true;

    this.chatService.enviar(mensaje).subscribe({
      next: (respuesta) => {
        this.mensajes = [...this.mensajes, { autor: 'academia', texto: respuesta.respuesta }];
        this.enviando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeDeApi(err, 'El chat no pudo responder.');
        this.enviando = false;
      },
    });
  }
}
