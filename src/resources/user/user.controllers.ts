import { User } from './user.model'
import { Handler, Request, Response } from 'express'
import { Document } from 'mongoose'

/**
 * @VAZNO
 *
 * U README-U SAM VEC REKAO DA CE        user      OBJEKAT, ILI USER Document
 *                                               BITI ZAKACENI REQUEST, STO CE URADITI MIDDLEWARE
 *                                                 KOJ ICU KASNIJE DEFINISATI
 *
 *
 *  AKO NE MOZES DA WRAPPUJES SVOJ MIND AROUND IT TREBA DA SHVATIS DA MIDDLEWARE
 * IMA PRISTUP TVOM REQUEST-U
 *
 * PRE NEGO STO MOUNT-UJES ROUTER, TI CES MOUNT-OVATI I MIDDLEWARE
 * ISTI REQUEST PROLAZI I KROZ ROUTER I KROZ MIDDLEWARE
 *
 * MOZDA JE DOBRO DA PROVEZBAS KAKO RADI MIDDLEWARE, AKO TI NIJE JASNO, ALI PRLICNO JE JEDNOSTAVNO, SAMO SE MOUNT-UJE NA
 * `NIZI` PATH TVOG REGUEST, NA PRIMER / ILI NESTO DERUGO
 *
 */


//  DOBRO, KAO STO SAM REKAO SA req-UST-A UZIMAM user-a , JER CE GA TAM OSTAVITI MIDDLEWARE

//  KONTROLER KOJI SAMO SEND-UJE NAZAD USER OBJEKAT, NE MORA DA BUDE ASINHRON JER USER OBJEKAT SKIDA SA REQUEST
//  ODNOSNO NE MORA DA GA QUERY-UJE 


export const me: Handler = (req: Request, res: Response) => {
  const user: any = (req as any).user

  res.status(200).json({ data: user })

  // AKO NEMA USER-A, BICE POSLAT NAZAD PRAZAN OBJEKAT

}


// SLEDECI HANDLER TREBA DA UPDATE-UJE BILO STA U NA USER DOCUMENTU
// BILO STA STO SE POSALJE U BODY-JU

// TO NARAVNO MOZE MITI EMAIL, PASSWORD, CAK I NAME, ALI I TEMA I COMPACT MODE, O KOJIMA SAM GOVORIO
// ODNOSNO KOJI SU DO SCHEMA-E

export const updateMe: Handler = async (req: Request, res: Response) => {

  const _id: string = (req as any).user._id

  try {

    const user: Document = await User.findByIdAndUpdate(_id, { ...req.body }, { new: true }).lean().exec()

    res.status(200).json({ data: user })

  } catch (error) {
    console.log(error)
    res.status(400).end()
  }

}
