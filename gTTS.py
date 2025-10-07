from gtts import gTTS

text = "Tell me about yourself."
tts = gTTS(text=text, lang='en')
tts.save("question.mp3")
