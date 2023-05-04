import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class AuthController {

  public showRegister({ view }: HttpContextContract){
    return view.render('auth/register')
  }

  public async register ({ request, auth, response }: HttpContextContract) {
    
    //gerando regras de validação
    const validationSchema = schema.create({
      name: schema.string({ trim: true }),
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.maxLength(255),
        rules.unique({ table: 'users', column: 'email' }),
      ]),
      password: schema.string({ trim: true }, [
        rules.confirmed(),
      ]),
    })

    //validando requisição
    const validatedData = await request.validate({
      schema: validationSchema,
    })

    //criando usuario caso passe pela validação
    const user = await User.create(validatedData)

    //realizando login
    await auth.login(user)

    return response.redirect('/')
  }

  public async logout ( { auth, response }: HttpContextContract) {
    //realizando o logout do usuario
    await auth.logout()
    //retornando a pagina inicial
    return response.redirect('/')
  }

  public showLogin ( { view }: HttpContextContract) {
    return view.render('auth/login')
  }

  public async login ({ request, auth, response, session }: HttpContextContract) {
    //recebendo os dados de login
    const { email, password } = request.all()

    try {
      //realizando o login do usuario
      await auth.attempt(email, password)

      //se os dados forem corretos redirecionar
      return response.redirect('/')

    } catch (error) {
      //caso tenha algum erro
      session.flash('notification', 'Não foi possível verificar suas informações')

      return response.redirect('back')
    }

  }
}
