from abc import ABC, abstractmethod

class APIService(ABC):
    @abstractmethod
    def fetch_data(self, *args, **kwargs):
        pass
