import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Guest {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    //verifica se estiver logado redireciona para a pagina inicial
    if (auth.isLoggedIn) {
      return response.redirect('/')
    }
    
    await next()
  }
}
