// noPage

import { esp, LibCurl, LibProgress } from 'esoftplay';
import * as DocumentPicker from 'expo-document-picker';

export default class m {

  static pick(mimeType?: string): Promise<any> {
    return new Promise((r) => {
      let _mimeType = mimeType || '*/*'
      DocumentPicker.getDocumentAsync({ type: _mimeType }).then((doc) => {
        const { type, uri, size, lastModified, output, file } = doc
        if (type != 'cancel' && uri) {
          r(doc)
        }
      })
    })
  }

  static upload(mimeType?: string): Promise<string> {
    return new Promise((r) => {
      let _mimeType = mimeType || '*/*'
      m.pick(_mimeType).then((doc) => {
        LibProgress.show('Mohon tunggu sedang mengunggah dokumen')
        new LibCurl().upload('image_upload', 'image', doc.uri, _mimeType,
          (res, msg) => {
            LibProgress.hide()
            r(res)
          },
          (msg) => {
            LibProgress.hide()
            esp.log('Document Gagal di Upload', msg.message)
          }
        )
      })
    })
  }

}