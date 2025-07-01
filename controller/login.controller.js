const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

exports.login = async (req, res) => {
  const { name, phone } = req.body;

  try {
    if (!name || !phone) {
      return res.status(400).send({ message: 'Name and phone are required.' });
    }

    // ตรวจสอบชื่อว่ามีอยู่ในระบบหรือไม่
    const existingUser = await prisma.users.findFirst({
      where: { name: name },
    });

    if (existingUser) {
      // ถ้าชื่อซ้ำ → เช็คว่าเบอร์ตรงหรือไม่
      if (existingUser.phone_number !== phone) {
        return res.status(400).send({ message: 'รหัสผ่านไม่ถูก' });
      }

      // เบอร์ตรง → ล็อกอินสำเร็จ
      return res.status(200).send({ message: 'Login successful.', user: existingUser });
    }

    // ถ้าชื่อไม่ซ้ำ → สร้างผู้ใช้ใหม่
    const newUser = await prisma.users.create({
      data: {
        name: name,
        phone_number: phone,
      },
    });

    return res.status(201).send({ message: 'User created successfully.', user: newUser });

  } catch (error) {
    return res.status(500).send({
      message: 'An error occurred.',
      error: error.message,
    });
  }
};
