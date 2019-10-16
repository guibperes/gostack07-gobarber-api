import { parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Mail } from '../../lib/Mail'

const mail = new Mail()

export class CancellationMail {
  get key () {
    return 'CancellationMail'
  }

  async handle ({ data }) {
    const { provider, user, date } = data

    await mail.sendMail({
      to: `${provider.name} <${provider.email}>`,
      subject: 'Agendamento Cancelado',
      template: 'cancellation',
      context: {
        provider: provider.name,
        user: user.name,
        date: format(
          parseISO(date),
          "'Dia' dd 'de' MMMM à's' H:mm'h'",
          { locale: ptBR }
        )
      }
    })
  }
}
