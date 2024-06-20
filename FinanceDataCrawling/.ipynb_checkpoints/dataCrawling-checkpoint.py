import OpenDartReader

### 0. 객체 생성 ###
# 객체 생성 (API KEY 지정) 
api_key = 'a81e18ac719d1e1e4ec2899ef25a737ab6cbb4c7'

dart = OpenDartReader(api_key) 
dart.list('삼성전자') # 기업이름