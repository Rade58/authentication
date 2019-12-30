import jwt from 'jsonwebtoken'

// SECRET CE OBICNO BITI PROVIDED KROZ NEKI config FAJL, KAKAV SAM VIDEO U WORKSHOP-U
// ALI ZA SADA SECRET CU UZIMATI DIREKTNO SA process-A

const SECRET: string = (process.env.SECRET as string)
const EXPIRATION: string = (process.env.EXPIRATION as string)

// DEFINISACU OVAJ INTERFACE, CISTO DA BUDE LAKSI TYPE ASSERTION

interface Payload {
  _id: string
  email: string
}


// SADA DEFINISEM FUNKCIJE, KOJE CE HANDLE-OVATI TOKEN-E

export const createToken = ({ _id, email }: { _id: string, email: string }): string => {        // NEKA TE NE PLASI OVO DESTRUKTURIRANJE OBJEKTA U TYPESCRIPT-U
  // NIJE NI MORALO OVDE DA SE DEFINISE, ALI NEKA GA
  // KAO PODSETNIK TOGA KAKO SE DEFINISE

  // NAMERNO CU DUZE PISATI, BEZ REFAKTORISANJA, DA BIH JEDNO MZASVAGDA POKAZAO STA JE STA
  // A U PRODUCTION-U, OVO BIH MOGAO REFAKTORISATI

  const payload: Payload = { _id, email }

  // DOBRA STVAR JE U TOME STO TI TYPESCRIPT GOVORI U KOJI MSVE FORMATIMA MOZE BITI expiresIn

  const token: string = jwt.sign(payload, SECRET, { expiresIn: EXPIRATION })

  // NA PRIMER KADA BUDES ZADAVAO expiresIn TI MOZES ZADATI I NUMBER VREDNOST (TO SE UVEK RACUNA DA SU SEKUNDE)
  // ALI MOZES I OVAKO ZADATI
  //                              "10h"       "2 days"

  return token

}


// SADA PRAVIM FUNKCIJU, KOJA UZIMA TOKEN I UZIMA SECRET, I OD TOGA TREBA DA IZBACI PAYLOAD (USER OBJEKAT)
// AKO VERIFIKACIJA BUDE U REDU; A U SUPROTNOM, IZBACICE ERROR
// U PITANJU JE ASINHRONA OPERACIJA

export const verifyToken = async (token: string): Promise<Payload> => {

  return new Promise((res, rej) => {

    jwt.verify(token, SECRET, (err, payload) => {

      if (err) return rej(err)

      res((payload as Payload))

    })

  })

}
