import { createToken, verifyToken } from './jwt'
import { User } from '../resources/user/user.model'
import { RequestHandler, Request, Response, NextFunction } from 'express'
import { Document } from 'mongoose'

// SIGNING IN KONTROLER, KOJI KREIRA TOKEN I SALJE GA KORISNIKU, AKO JE USPESAN SIGNING UP
// ODNOSNO AKO JE USPESNO KREIRANJE NALOGA

export const signUp: RequestHandler = async (req: Request, res: Response): Promise<void | Response> => {

  const body = req.body

  if (!body.email || !body.password) return res.status(400).json({ message: "Need password or email!" })

  const { email, password } = body

  try {

    const user: Document = await User.create({ email, password })

    const token = createToken((user as any))

    // OVAJ KORAK MI JE UPITAN, MOZDA SAM TREBAO POSLATI token KAO VREDNOST Authorization HEADER-A
    // USTVARI CITAJUCI NEKE CLANKE VIDEO SAM

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

export const signIn: RequestHandler = async (req: Request, res: Response): Promise<void | Response> => {

  const { email, password }: { email: string, password: string } = req.body

  if (!email || !password) return res.status(400).send({ message: "Need email or password" })

  const invalid = { message: 'Invalid email and password combination!' }

  try {

    const user = await User.findOne({ email }).select('email password').exec()      // AKO NE BUDE BIO PROVIDED U SELECTION DODAJ I checkPassword

    if (!user) return res.status(401).send(invalid)

    // IMAMO OVDE NESTED TRY CATCH BLOK, ZBOG TOGA KAKO IZGLEDA     checkPassword
    // NJOJ JE Promise POVRATNA VREDNOST (I TO PROMISE KOJI MOZE REJECT-OVATI I LI RESOLVE-OVATI)

    try {

      await (user as any).checkPassword(password)

      const token = createToken({ _id: user._id, email: (user as any).email })

      // AKO IMAS MATCHING PASSWORD, SALJES TOKEN

      return res.status(201).send({ token })

    } catch (err) {
      return res.status(401).send(invalid)
    }


  } catch (error) {
    console.log(error)

    res.status(500).end()
  }

}



// SADA KREIRAM MIDDLEWARE, KOJI CE BITI MOUNTED ZA SVAKI KRIRANI API

// CILJ MU JE DA PROVERI Authorization Bearer HEADER REQUEST-A

// AKO JE TU TOKEN, UZIMAM NJEGA I SECRET, U NADI DA CE IZ TOGA PROIZICI PAYLOAD

// AKO JE TU PAYLOAD I SLAZE SE SA EMAIL-OM I ID-JEM KORISNIKA, user OBJEKAT CU INSERTOVATI NA REQUEST OBJEKAT I POZVATI next

/**
 * @MIDDLEWARE IMA PRISTUP I Request-U, ALI I Response-U
 * 
 * STO ZNACI DA AKO NESTO NIJE U REDU, MIDDLEWARE MOZE END-OVATI ODNOSNO MOZE POSLATI NA PRIMER       res.status(401).send("unauthorized")
 * 
 * I TIME 
 * 
 */

export const protect: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

  const bearer: string | undefined = req.headers.authorization

  if (!bearer) return res.status(401).end()

  if (!bearer.startsWith('Bearer')) return res.status(401).end()

  const token: string = bearer.split('Bearer ')[1].trim()

  try {

    // PAYLOAD
    const { _id, email } = await verifyToken(token)

    // TRAZIM KORINIKA KORISCENJEM PAYLOAD-A

    try {
      const user = await User.findOne({ _id, email }).select('-password').exec()

      if (!user) { return res.status(401).end() }

      (req as any).user = user

      next()

    } catch (error) {
      return res.status(401).end()
    }



  } catch (error) {

    res.status(401).end()

  }



}


/**
 *
 * @VAZNO
 */
// CISTO JEDNA NAPOMENA

// TI IMAS OBICAJ DA NESTUJES try catch BLOKOVE
// MOZDA JE TO LOSA PRAKASA

// MISLIM DA JE AUTOR WORKSHOP-A IAMO PAR GRESAKA, KOJE SAM SE GORE TRUDIO DA ISPRAVIM
