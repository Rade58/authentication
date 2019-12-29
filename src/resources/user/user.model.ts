import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

// OVO JE OBJEKAT KOJI PREDSTAVLAJ DEFINICIJU SCHEMA-E

const userSchemaDefinition: mongoose.SchemaDefinition = {
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  // OVO SU DODATNI SETTINGSI; ONDONO SASTOJE SE OD PODATAKA, KOJI SE NECE PROSLEDJIVATI, PRI KREIRANJU DOKUMENTA
  // AL ICE BITI KREIRANI SA SVOJIM DEFAULT-OVIMA
  settings: {
    // PO DEFAULTU TEMA CE BITI DARK
    theme: {
      type: String,
      required: true,
      default: 'dark'
    },
    // PO DEFAULTU, KORISNIKU CE SE SLATI NOTIFICATIONS (PODSETI SE KAKO SE ONE PODESAVAJU (PWA KUSRS))
    notifications: {
      type: Boolean,
      required: true,
      default: true
    },
    // PREDPOSTAVLJAM DA JE OVA OPCIJA VEZANA ZA RESPONSIVNES
    compactMode: {
      type: Boolean,
      required: true,
      default: true
    }
    // MOZDA AKO KORISNIK NEKADA PROMENI OVU OPCIJU, MOZDA CE MU BITI POSLAT DESKTOP SITE, A NE RESPONSIVE

  }
}

// USER SCHEMA, PRVI ARGUMENT JE PREDHODNI OBJEKAT

const userSchema: mongoose.Schema = new mongoose.Schema(
  userSchemaDefinition,
  { timestamps: true }
)

// NAKON STO SAM DEFINISAO SCHEMA-U, NAJBOLJE JE DA VIZUALIZUJEM, KOJE BI TO HOOK-OVE MOGAO UPOTREBITI NA SCHEMA-I

/**
 * @HASHING PASSWORD-A
 * 
 *  SE MOZE OBAVLJATI KROZ HOOK-OVE,
 * 
 */

// MEDDJUTIM OVDE MORAM MALO UCI U 'PURE MONGODB LAND'

//       U HOOK-OVIMA, KOJE CU KORISTITI, JA CU MORATI KORISTITI DVE METODE NAD MONGODB DOKUMENTOM, KOJE SU DEO     MONGODB API   ,A   NE MONGOOSE-A

//            HOOK-OVI (MIDDLEWARE IZMEDJU MONGODB JAVASCRIPT API I MONGOOSE-A)


/**
 * @DODAVANJE NOVIH USER-A
 *
 *@MENJANE :
 -            PASSWORDA, ILI MENJANJE EMAIL-A, ILI DRUGIH FIELD-OVA
 -

 @OVO JE MOZDA KORINO

                        **        NIKAD SE NE POHRANJIVAJU KONKRETNI PASSWORDI        **
                        **        U DATBASE TREBA DA IDE, NJIHOV HASH,                **
                        **        KADA SE UZIMAJU

* KADA SE DODAJE NOVI user DOKUMENT, PASSWORD TREBA DA SE HASH-UJE
* KADA SE MENJA SIFRA, ODNSONO, KADA SE UPDATE-UJE, ONA OPET TREBA DA SE HASH-UJE


 */



const model = mongoose.model('user', userSchema)

// model.upda