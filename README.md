<p align="center">
  <img src="https://github.com/Leaf48/YuiGPT-Discord-Bot/assets/58620209/96312433-13de-4db3-9fda-7003b7bde16f">
</p>

# YuiGPT-Discord-Bot
You Can Talk Virtual Character Yui via Voice Chat, Powered by WhisperAI and ChatGPT

## Environments
### Docker
```docker
docker run -d --rm -p '127.0.0.1:50021:50021' voicevox/voicevox_engine:cpu-ubuntu20.04-latest
```

### .env
全くと言っていいほどキャラクター設定はしてないので、必要に応じて設定してください。<br>
The character has not been set up the charactarization at all, so you can set up if you need to.
```.env
token=abcdefg
openai=123456
character="唯(ゆい)です。"
```
### Characters
```json
[
  {
    "supported_features": {
      "permitted_synthesis_morphing": "SELF_ONLY"
    },
    "name": "四国めたん",
    "speaker_uuid": "7ffcb7ce-00ec-4bdc-82cd-45a8889e43ff",
    "styles": [
      {
        "name": "ノーマル",
        "id": 2
      },
      {
        "name": "あまあま",
        "id": 0
      },
      {
        "name": "ツンツン",
        "id": 6
      },
      {
        "name": "セクシー",
        "id": 4
      },
      {
        "name": "ささやき",
        "id": 36
      },
      {
        "name": "ヒソヒソ",
        "id": 37
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "SELF_ONLY"
    },
    "name": "ずんだもん",
    "speaker_uuid": "388f246b-8c41-4ac1-8e2d-5d79f3ff56d9",
    "styles": [
      {
        "name": "ノーマル",
        "id": 3
      },
      {
        "name": "あまあま",
        "id": 1
      },
      {
        "name": "ツンツン",
        "id": 7
      },
      {
        "name": "セクシー",
        "id": 5
      },
      {
        "name": "ささやき",
        "id": 22
      },
      {
        "name": "ヒソヒソ",
        "id": 38
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "春日部つむぎ",
    "speaker_uuid": "35b2c544-660e-401e-b503-0e14c635303a",
    "styles": [
      {
        "name": "ノーマル",
        "id": 8
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "雨晴はう",
    "speaker_uuid": "3474ee95-c274-47f9-aa1a-8322163d96f1",
    "styles": [
      {
        "name": "ノーマル",
        "id": 10
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "波音リツ",
    "speaker_uuid": "b1a81618-b27b-40d2-b0ea-27a9ad408c4b",
    "styles": [
      {
        "name": "ノーマル",
        "id": 9
      },
      {
        "name": "クイーン",
        "id": 65
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "玄野武宏",
    "speaker_uuid": "c30dc15a-0992-4f8d-8bb8-ad3b314e6a6f",
    "styles": [
      {
        "name": "ノーマル",
        "id": 11
      },
      {
        "name": "喜び",
        "id": 39
      },
      {
        "name": "ツンギレ",
        "id": 40
      },
      {
        "name": "悲しみ",
        "id": 41
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "白上虎太郎",
    "speaker_uuid": "e5020595-5c5d-4e87-b849-270a518d0dcf",
    "styles": [
      {
        "name": "ふつう",
        "id": 12
      },
      {
        "name": "わーい",
        "id": 32
      },
      {
        "name": "びくびく",
        "id": 33
      },
      {
        "name": "おこ",
        "id": 34
      },
      {
        "name": "びえーん",
        "id": 35
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "青山龍星",
    "speaker_uuid": "4f51116a-d9ee-4516-925d-21f183e2afad",
    "styles": [
      {
        "name": "ノーマル",
        "id": 13
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "冥鳴ひまり",
    "speaker_uuid": "8eaad775-3119-417e-8cf4-2a10bfd592c8",
    "styles": [
      {
        "name": "ノーマル",
        "id": 14
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "SELF_ONLY"
    },
    "name": "九州そら",
    "speaker_uuid": "481fb609-6446-4870-9f46-90c4dd623403",
    "styles": [
      {
        "name": "ノーマル",
        "id": 16
      },
      {
        "name": "あまあま",
        "id": 15
      },
      {
        "name": "ツンツン",
        "id": 18
      },
      {
        "name": "セクシー",
        "id": 17
      },
      {
        "name": "ささやき",
        "id": 19
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "SELF_ONLY"
    },
    "name": "もち子さん",
    "speaker_uuid": "9f3ee141-26ad-437e-97bd-d22298d02ad2",
    "styles": [
      {
        "name": "ノーマル",
        "id": 20
      },
      {
        "name": "セクシー／あん子",
        "id": 66
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "剣崎雌雄",
    "speaker_uuid": "1a17ca16-7ee5-4ea5-b191-2f02ace24d21",
    "styles": [
      {
        "name": "ノーマル",
        "id": 21
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "WhiteCUL",
    "speaker_uuid": "67d5d8da-acd7-4207-bb10-b5542d3a663b",
    "styles": [
      {
        "name": "ノーマル",
        "id": 23
      },
      {
        "name": "たのしい",
        "id": 24
      },
      {
        "name": "かなしい",
        "id": 25
      },
      {
        "name": "びえーん",
        "id": 26
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "後鬼",
    "speaker_uuid": "0f56c2f2-644c-49c9-8989-94e11f7129d0",
    "styles": [
      {
        "name": "人間ver.",
        "id": 27
      },
      {
        "name": "ぬいぐるみver.",
        "id": 28
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "No.7",
    "speaker_uuid": "044830d2-f23b-44d6-ac0d-b5d733caa900",
    "styles": [
      {
        "name": "ノーマル",
        "id": 29
      },
      {
        "name": "アナウンス",
        "id": 30
      },
      {
        "name": "読み聞かせ",
        "id": 31
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "ちび式じい",
    "speaker_uuid": "468b8e94-9da4-4f7a-8715-a22a48844f9e",
    "styles": [
      {
        "name": "ノーマル",
        "id": 42
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "櫻歌ミコ",
    "speaker_uuid": "0693554c-338e-4790-8982-b9c6d476dc69",
    "styles": [
      {
        "name": "ノーマル",
        "id": 43
      },
      {
        "name": "第二形態",
        "id": 44
      },
      {
        "name": "ロリ",
        "id": 45
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "小夜/SAYO",
    "speaker_uuid": "a8cc6d22-aad0-4ab8-bf1e-2f843924164a",
    "styles": [
      {
        "name": "ノーマル",
        "id": 46
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "ナースロボ＿タイプＴ",
    "speaker_uuid": "882a636f-3bac-431a-966d-c5e6bba9f949",
    "styles": [
      {
        "name": "ノーマル",
        "id": 47
      },
      {
        "name": "楽々",
        "id": 48
      },
      {
        "name": "恐怖",
        "id": 49
      },
      {
        "name": "内緒話",
        "id": 50
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "†聖騎士 紅桜†",
    "speaker_uuid": "471e39d2-fb11-4c8c-8d89-4b322d2498e0",
    "styles": [
      {
        "name": "ノーマル",
        "id": 51
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "雀松朱司",
    "speaker_uuid": "0acebdee-a4a5-4e12-a695-e19609728e30",
    "styles": [
      {
        "name": "ノーマル",
        "id": 52
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "麒ヶ島宗麟",
    "speaker_uuid": "7d1e7ba7-f957-40e5-a3fc-da49f769ab65",
    "styles": [
      {
        "name": "ノーマル",
        "id": 53
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "春歌ナナ",
    "speaker_uuid": "ba5d2428-f7e0-4c20-ac41-9dd56e9178b4",
    "styles": [
      {
        "name": "ノーマル",
        "id": 54
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "猫使アル",
    "speaker_uuid": "00a5c10c-d3bd-459f-83fd-43180b521a44",
    "styles": [
      {
        "name": "ノーマル",
        "id": 55
      },
      {
        "name": "おちつき",
        "id": 56
      },
      {
        "name": "うきうき",
        "id": 57
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "ALL"
    },
    "name": "猫使ビィ",
    "speaker_uuid": "c20a2254-0349-4470-9fc8-e5c0f8cf3404",
    "styles": [
      {
        "name": "ノーマル",
        "id": 58
      },
      {
        "name": "おちつき",
        "id": 59
      },
      {
        "name": "人見知り",
        "id": 60
      }
    ],
    "version": "0.14.4"
  },
  {
    "supported_features": {
      "permitted_synthesis_morphing": "SELF_ONLY"
    },
    "name": "中国うさぎ",
    "speaker_uuid": "1f18ffc3-47ea-4ce0-9829-0576d03a7ec8",
    "styles": [
      {
        "name": "ノーマル",
        "id": 61
      },
      {
        "name": "おどろき",
        "id": 62
      },
      {
        "name": "こわがり",
        "id": 63
      },
      {
        "name": "へろへろ",
        "id": 64
      }
    ],
    "version": "0.14.4"
  }
]
```
