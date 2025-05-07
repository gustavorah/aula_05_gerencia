import nodemailer from 'nodemailer';
import { Tarefa } from '../types/tarefa';

// Define types for email operations
type EmailType = 'task_created' | 'task_updated' | 'task_completed' | 'task_deleted';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create a nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Generate email subject based on event type
const getEmailSubject = (type: EmailType, tarefa?: Tarefa): string => {
  const baseSubject = 'Sistema de Tarefas - ';
  
  switch (type) {
    case 'task_created':
      return `${baseSubject}Nova Tarefa Criada`;
    case 'task_updated':
      return `${baseSubject}Tarefa Atualizada`;
    case 'task_completed':
      return `${baseSubject}Tarefa Concluída`;
    case 'task_deleted':
      return `${baseSubject}Tarefa Excluída`;
    default:
      return `${baseSubject}Notificação`;
  }
};

// Generate HTML template for task notification
const getEmailTemplate = (type: EmailType, tarefa: Tarefa, userName: string): string => {
  // Format date for display
  const formatDate = (date: string | null): string => {
    if (!date) return 'Não definida';
    return new Date(date).toLocaleString('pt-BR');
  };
  
  // Common task details template
  const taskDetails = `
    <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #3b82f6; background-color: #f9fafb;">
      <h3 style="margin: 0 0 10px 0; color: #111827;">${tarefa.descricao}</h3>
      <p><strong>Data de Criação:</strong> ${formatDate(tarefa.data_criacao)}</p>
      <p><strong>Data de Previsão:</strong> ${formatDate(tarefa.data_previsao)}</p>
      ${tarefa.data_encerramento ? `<p><strong>Data de Encerramento:</strong> ${formatDate(tarefa.data_encerramento)}</p>` : ''}
      <p><strong>Situação:</strong> ${tarefa.situacao ? 'Concluída' : 'Em aberto'}</p>
    </div>
  `;
  
  // Template header and style
  let template = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #374151;">
      <h2 style="color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
  `;
  
  // Content based on notification type
  switch (type) {
    case 'task_created':
      template += `
        Nova Tarefa Criada
      </h2>
      <p>Olá ${userName},</p>
      <p>Uma nova tarefa foi criada no sistema:</p>
      ${taskDetails}
      <p>Acesse o sistema para gerenciar suas tarefas.</p>
      `;
      break;
      
    case 'task_updated':
      template += `
        Tarefa Atualizada
      </h2>
      <p>Olá ${userName},</p>
      <p>Uma tarefa foi atualizada no sistema:</p>
      ${taskDetails}
      <p>Acesse o sistema para verificar todas as atualizações.</p>
      `;
      break;
      
    case 'task_completed':
      template += `
        Tarefa Concluída
      </h2>
      <p>Olá ${userName},</p>
      <p>Uma tarefa foi marcada como concluída:</p>
      ${taskDetails}
      <p>Parabéns por completar mais uma tarefa!</p>
      `;
      break;
      
    case 'task_deleted':
      template += `
        Tarefa Excluída
      </h2>
      <p>Olá ${userName},</p>
      <p>Uma tarefa foi excluída do sistema:</p>
      ${taskDetails}
      <p>Esta tarefa foi removida permanentemente do sistema.</p>
      `;
      break;
      
    default:
      template += `
        Notificação de Tarefa
      </h2>
      <p>Olá ${userName},</p>
      <p>Houve uma atualização em suas tarefas:</p>
      ${taskDetails}
      <p>Acesse o sistema para mais detalhes.</p>
      `;
  }
  
  // Template footer
  template += `
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <p>Esta é uma mensagem automática. Por favor, não responda a este email.</p>
        <p>© ${new Date().getFullYear()} Sistema de Gerenciamento de Tarefas</p>
      </div>
    </div>
  `;
  
  return template;
};

// Main function to send email notification
export const sendTaskNotification = async (
  type: EmailType,
  tarefa: Tarefa,
  userEmail: string,
  userName: string
): Promise<boolean> => {
  try {
    userEmail = 'gustavo.rahmeier@universo.univates.br';
    const transporter = createTransporter();
    const subject = getEmailSubject(type, tarefa);
    const html = getEmailTemplate(type, tarefa, userName);
    
    const mailOptions: EmailOptions = {
      to: userEmail,
      subject,
      html,
    };
    
    // Add from address if configured
    if (process.env.EMAIL_FROM) {
      mailOptions['from'] = process.env.EMAIL_FROM;
    }
    
    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent: ${type} for task ID ${tarefa.id}`);
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

// Function to send test email
export const sendTestEmail = async (to: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Test Email from Task Management System',
      html: '<h1>Test Email</h1><p>This is a test email from the Task Management System.</p>',
    });
    
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
};

