import { createToken, verifyToken } from './jwt'
import { User } from '../resources/user/user.model'
import { RequestHandler, Request, Response, NextFunction } from 'express'
import { Document } from 'mongoose'

// SIGNING IN KONTROLER, KOJI KREIRA TOKEN I SALJE GA KORISNIKU, AKO JE USPESAN SIGNING UP
// ODNOSNO AKO JE USPESNO KREIRANJE NALOGA

export const signUp: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {

  const body = req.body

  if (!body.email || !body.password) return res.status(400).json({ message: "Need password or email!" })

  const { email, password } = body

  try {

    const user: Document = await User.create({ email, password })

    const token = createToken((user as any))

    res.status(201).send({ token })

  } catch (error) {

    console.log(error)

    res.status(500).end()

  }

}


// SIGN IN KONTROLER, KOJI TREB DA DOHVATI IZ DTBASE-A USER OBJEKAT, AKO JE USPESNO PRIJAVLJIVANJE
// TREBA DA KREIRA TOKEN ONDA, KOJI SALJE NAZAD KORISNIKU

// DA ALI OVDE MORAJU NARAVNO DA SE OBAVE DODATNE PROVERE, KAO STO JE PROVERA PASSWORDA (AKO SE SECAS UPRAVO SI KREIRAO METODU NA USER SCHEMA-I
//                                                                                        KOJA UPRAVO VALIDIRA SIFRU) 
