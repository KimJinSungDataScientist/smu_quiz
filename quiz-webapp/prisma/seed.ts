import { prisma } from '@/lib/db'
import { hash } from '@/lib/auth'

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPw = process.env.ADMIN_PASSWORD || 'admin1234'
  const adminName = process.env.ADMIN_NAME || 'Super Admin'

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, name: adminName, passwordHash: hash(adminPw), role: 'ADMIN' }
  })

  const quiz = await prisma.quiz.create({
    data: {
      title: '샘플 퀴즈',
      description: '기본 예시 퀴즈',
      isPublished: true,
      authorId: admin.id,
      questions: { create: [
        { text: '2 + 2 = ?', options: { create: [
          { text: '3', isCorrect: false },
          { text: '4', isCorrect: true },
          { text: '5', isCorrect: false }
        ]}},
        { text: '대한민국 수도는?', options: { create: [
          { text: '부산', isCorrect: false },
          { text: '서울', isCorrect: true },
          { text: '인천', isCorrect: false }
        ]}}
      ]}
    }
  })
  console.log('Seeded admin & quiz:', admin.email, quiz.title)
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})
