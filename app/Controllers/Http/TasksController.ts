import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'
import { schema, rules } from '@ioc:Adonis/Core/Validator'


export default class TasksController {
  public async index ({ view, auth }: HttpContextContract) {
    //buscando todas as tarefas do usuario
    const user = auth.user
    await user?.preload('tasks')
    return view.render('tasks/index', { tasks: user?.tasks })
  }

  public async store ({ request, response, session, auth }: HttpContextContract) {
    //criando validação do campo title
    const validationSchema = schema.create({
      title: schema.string({ trim: true }, [
        rules.maxLength(255),
      ])
    })
    //gerando mensagens de retorno dos erros
    const validatedData = await request.validate({
      schema: validationSchema, 
      messages: {
        'title.required': 'O Campo Titulo é obrigatório',
        'title.maxLength': 'O Campo Titulo não deve exeder 255 caracteres'
      }
    })

    //validando e inserindo no banco, se atendeu todos os paramentros
    await auth.user?.related('tasks').create({
      title: validatedData.title,
    })

    //retornando mensagem para a view que a tarefa foi adicionada
    session.flash('notification', 'Tarefa Adicionada!')

    //retornando para a pagina
    return response.redirect('back')
  }

  public async update({ request, response, session, params }: HttpContextContract){
    //buscando tarefa por id
    const task = await Task.findByOrFail('id', params.id)

    //pegado o boleano e fazendo a alteração
    task.isCompleted = !!request.input('completed')
    //salvando no banco
    await task.save()

    //enviando mensagem de conclusão na pagina
    session.flash('notification', 'Tarefa Concluida!')

    //voltando para a pagina
    return response.redirect('back')
  }

  public async destroy ({ response, session, params }: HttpContextContract){
    //buscando tarefa por id
    const task = await Task.findByOrFail('id', params.id)

    //deletando o registro 
    await task.delete()

    //enviando mensagem para a pagina
    session.flash('notification', 'Tarefa removida!')

    //voltando para a pagina
    response.redirect('back')
  }

}
 