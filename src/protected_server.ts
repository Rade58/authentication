/**
 * @zasto SE OVAJ FAJ NAZIVA protected_server
 *
 * ZATO STO MI JE CILJ DA OVDE UPOTREBIM MIDDLEWARWE  KOJI VRSE VALIDACIJU TOKENA (ODNOSNO KOJI PROTECT-UJE BILO KOJI API)
 * JER ZA SVAKI VERB OVDE, ODNOSN OZA SVAKI ROUTE, KOJI BI SE DEFINISAO OVDE
 * MIDDLEWARE TREBA DA SE POSTARAJU DA IH SAMO KORISNIK SA VALIDNIM TOKENOM MOZE KORISTITI
 */

// NARAVNO TU IZUZIMAM ONE ENDPOINTE ZA signUp I signIn (JER DA TU STAVIM MIDDLEWARE, TO NE BI BILO LOGICNO, A I KREIRANJE KORISNIKA N BI BILO MOGUCE)


// DA UZMEM PRVO LIBRARY-JE

import express from 'express'
import morgan from 'morgan'
import cors from 'cors'     // MOZDA OVO I NE TREBAM KORISTITI (USTVARI OVO MI NE TREBA, JER JA NE PRAVIM PUBLIC API)
import { urlencoded, json } from "body-parser";

// SADA MOZES DA UVEZES SVE STO SI RANIJE PRAVIO

import { signIn, signUp, protect } from './utils/auth'

// UVEZI NARAVNO USER ROUTER
import userRouter from "./resources/user/user.router"

//////////////////////////////////
/**
 * @OVDE BI NA PRIMER MOGAO DA UVEZES BILO KOJI DRUGI ROUTER, KOJI SI NAPRAVIO
 *
 */

////////////////////

// UVEZI FUNKCIJA ZA CONNECTING NA DATBASE

import { connect } from './utils/db'

////////////////////////////////////////////////////////////////////////////////////


const app: express.Application = express()

// DISABLE-UJEM OVAJ HEADER, KOJI GOVORO DA JE REC O EXPRESS-U
app.disable('x-powered-by')
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))


app.post('/signup', signUp)
app.post('/signin', signIn)



// MOUNTUJEM MIDDLEWARE
app.use('/api', protect)

// KACIM USER ROUTER, KOJI TREBA DA PROTECT-UJEM, JER KAO STO SAM REKAO ON UZIMA USER-A SA REQUESTA, A PREDHODNI MIDDLEWARE GA TAMO KACI
app.use('/api/user', userRouter)

// OVDE BI MOUNT-OVAO BILO KOJI DRUGI ROUTER, ODNOSNO BILO KOJI APUI, CIJI BI POCETNI PATH BIO /api (KAKO BI BIO PROTECTED)
////////////////////////////////////////////////
/**
 * @ROUTERI
 */







///////////////////////////////////////////////////////////
///////////////////////////////////////////////////

// start FUNKCIJA, POKRENUCU JE U index.ts

const start = () => {
  connect()
    .then(() => {

      app.listen(3000, () => {

        console.log('REST API on http://localhost:3000/api/')

      })

    })
    .catch((err) => {
      console.log(err)
    })
}

export default start

