import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt

generator = tf.keras.models.load_model('./model/xray_generator.keras')
noise = np.random.normal(0, 1, (1, 500))
generated_image = generator.predict(noise)
print(generated_image.shape)


def gen_img():
  noise = np.random.normal(0, 1, (10, 500))
  p = generator(noise)
  rows = 2
  j = 0
  plt.figure()
  _, a = plt.subplots(rows, 5)
  x = 0
  for i in range(rows):
    for j in range(int(len(p)/rows)):
      a[i, j].imshow(p[x]*127.5 + 127.5, cmap='gray')
      a[i, j].axis('off')
      x += 1
  plt.savefig("./xray_generated.jpeg")
  plt.show()

gen_img()