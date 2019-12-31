import mongoose from 'mongoose'

// SECRET STVARI

const DATBASE_NAME = process.env.DATABASE_NAME


// FUNKCIJA ZA CONNECTING NA DATBASE

export const connect = async () => {

  return await mongoose.connect(
    `mongodb://localhost:27017/${DATBASE_NAME}`,
    { useUnifiedTopology: true, useNewUrlParser: true }
  )

}



